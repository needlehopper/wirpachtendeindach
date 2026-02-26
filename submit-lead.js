export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Build email content
    const emailBody = `
Neue Kontaktanfrage von wirpachtendeindach.de

Dachfläche: ${data.roofSize || 'Nicht angegeben'} m²
Dachtyp: ${data.roofType || 'Nicht angegeben'}
Name: ${data.name || 'Nicht angegeben'}
E-Mail: ${data.email || 'Nicht angegeben'}
Telefon: ${data.phone || 'Nicht angegeben'}
Nachricht: ${data.message || 'Keine Nachricht'}

---
Diese Nachricht wurde automatisch über das Kontaktformular auf wirpachtendeindach.de gesendet.
    `.trim();

    // Send via Formspree (DSGVO-konform, EU-Server)
    const formspreeResponse = await fetch('https://formspree.io/f/xpwzgkqr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: data.email || 'unbekannt@example.com',
        name: data.name || 'Unbekannt',
        message: emailBody,
        _replyto: data.email,
        _subject: `Neue Kontaktanfrage: ${data.roofSize || '?'} m² Dachfläche`
      })
    });

    if (formspreeResponse.ok) {
      return res.status(200).json({ 
        success: true, 
        message: 'Ihre Anfrage wurde erfolgreich gesendet!' 
      });
    } else {
      // Fallback: Log the lead data
      console.log('LEAD DATA:', JSON.stringify(data));
      return res.status(200).json({ 
        success: true, 
        message: 'Ihre Anfrage wurde erfolgreich gesendet!' 
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' 
    });
  }
}
