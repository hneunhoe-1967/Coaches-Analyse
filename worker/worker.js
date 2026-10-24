// Absichtlich deaktiviert. Kein öffentlich nutzbarer Workflow-Start ohne echte Authentifizierung.
export default { async fetch() { return new Response(JSON.stringify({message:'Zentraler Datenimport bis zur Freigabe deaktiviert'}),{status:403,headers:{'Content-Type':'application/json'}}); } };
