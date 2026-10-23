/**
 * Start-Dienst für den Aktualisieren-Button (Cloudflare Worker).
 *
 * Der Button der App ruft POST /start auf. Der Worker startet daraufhin den
 * GitHub-Workflow „Daten einlesen“. Der GitHub-Schlüssel bleibt hier geheim
 * und gelangt nie in die öffentliche App.
 *
 * Einstellungen im Worker (Settings → Variables):
 *   REPO               z. B. "meinname/coaches-analyse"
 *   WORKFLOW           "einlesen.yml"
 *   BRANCH             "main"
 *   ERLAUBTE_HERKUNFT  Adresse der App, z. B. "https://meinname.github.io"
 *   GITHUB_TOKEN       (als Secret) Fine-grained Token nur für dieses Repository,
 *                      Berechtigung „Actions: Read and write“
 */
const SPERRE_MINUTEN = 15;

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ERLAUBTE_HERKUNFT,
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if ((request.headers.get('Origin') || '') !== env.ERLAUBTE_HERKUNFT) {
      return antwort({ meldung: 'Diese Seite darf das Einlesen nicht starten.' }, 403, cors);
    }

    const github = (pfad, init = {}) => fetch(`https://api.github.com/repos/${env.REPO}${pfad}`, {
      ...init,
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'coaches-analyse-start',
        ...(init.headers || {}),
      },
    });
    const letzterLauf = async () => {
      const r = await github(`/actions/workflows/${env.WORKFLOW}/runs?per_page=1`);
      if (!r.ok) throw new Error(`GitHub antwortet mit ${r.status}`);
      return (await r.json()).workflow_runs?.[0] || null;
    };

    const pfad = new URL(request.url).pathname;
    try {
      if (pfad === '/status' && request.method === 'GET') {
        const lauf = await letzterLauf();
        return antwort({ status: lauf?.status ?? 'unbekannt', ergebnis: lauf?.conclusion ?? null, gestartet: lauf?.created_at ?? null }, 200, cors);
      }
      if (pfad === '/start' && request.method === 'POST') {
        const lauf = await letzterLauf();
        if (lauf && lauf.status !== 'completed') {
          return antwort({ meldung: 'Das Einlesen läuft bereits. Die App lädt die neuen Daten, sobald sie fertig sind.' }, 429, cors);
        }
        if (lauf && Date.now() - Date.parse(lauf.created_at) < SPERRE_MINUTEN * 60000) {
          return antwort({ meldung: `Die Daten wurden vor weniger als ${SPERRE_MINUTEN} Minuten eingelesen. Bitte später erneut versuchen.` }, 429, cors);
        }
        const r = await github(`/actions/workflows/${env.WORKFLOW}/dispatches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ref: env.BRANCH || 'main', inputs: { modus: 'aktualisieren' } }),
        });
        if (r.status !== 204) return antwort({ meldung: `GitHub hat den Start abgelehnt (${r.status}).` }, 502, cors);
        return antwort({ meldung: 'Einlesen gestartet.' }, 202, cors);
      }
      return antwort({ meldung: 'Unbekannte Adresse.' }, 404, cors);
    } catch (e) {
      return antwort({ meldung: `Start-Dienst nicht verfügbar: ${e.message}` }, 502, cors);
    }
  },
};

function antwort(daten, status, kopf) {
  return new Response(JSON.stringify(daten), { status, headers: { ...kopf, 'Content-Type': 'application/json; charset=utf-8' } });
}
