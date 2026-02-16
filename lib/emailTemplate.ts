export function newsletterTemplate(header: string, content: string) {
  return `
  <div style="max-width: 600px; margin: auto; font-family: Arial;">
    <div style="padding: 20px; background: #0f172a; color: white;">
      <h2>${header}</h2>
    </div>

    <div style="padding: 20px; background: #f8fafc; color: #333;">
      ${content}
    </div>

    <div style="padding: 15px; font-size: 12px; text-align: center; color: #777;">
      Church of Christ Newsletter<br/>
      <a href="{{UNSUBSCRIBE_URL}}" style="color:red; text-decoration:none;">
        Unsubscribe
      </a>
    </div>
  </div>
  `;
}
