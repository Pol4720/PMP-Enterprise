/**
 * Textos legales. Revisa con asesoría jurídica antes del lanzamiento si operas en
 * jurisdicciones con requisitos específicos. {email} y {name} se sustituyen automáticamente.
 */
type Section = { h: string; p: string[] };
type Doc = { title: string; intro: string; updated: string; sections: Section[] };

export const legal: Record<'es' | 'en', { privacy: Doc; cookies: Doc }> = {
  es: {
    privacy: {
      title: 'Política de privacidad',
      intro: 'En {name} tratamos los datos personales con el mismo rigor que aplicamos a nuestro trabajo: solo recogemos lo necesario, lo protegemos y nunca lo vendemos.',
      updated: 'Última actualización',
      sections: [
        { h: 'Responsable', p: ['El responsable del tratamiento es {name}. Puedes escribirnos para cualquier consulta sobre tus datos a {email}.'] },
        { h: 'Qué datos recogemos', p: ['Solo los que nos envías a través del formulario de contacto o por correo electrónico: nombre, dirección de correo, organización (opcional) y el contenido de tu mensaje.', 'No pedimos datos sensibles. Te rogamos que no los incluyas en tus mensajes.'] },
        { h: 'Para qué los usamos', p: ['Exclusivamente para responder a tu consulta y, si lo solicitas, para preparar una propuesta de servicios. No los usamos para publicidad ni los cedemos a terceros con fines comerciales.'] },
        { h: 'Base legal', p: ['Tu consentimiento, que otorgas al marcar la casilla del formulario, y nuestro interés legítimo en atender las solicitudes que recibimos.'] },
        { h: 'Proveedores que intervienen', p: ['Formulario: los mensajes se transmiten mediante Formspree (formspree.io), que actúa como encargado del tratamiento y los entrega a nuestro correo.', 'Alojamiento: el sitio se sirve desde GitHub Pages (GitHub, Inc.), que puede registrar datos técnicos de conexión, como la dirección IP, por motivos de seguridad.', 'Estadísticas: usamos GoatCounter, una herramienta de analítica respetuosa con la privacidad que no utiliza cookies ni identifica a las personas. Solo contabiliza visitas de forma agregada.'] },
        { h: 'Cuánto tiempo los conservamos', p: ['Mientras dure la conversación o la relación profesional que se derive de ella y, después, el tiempo mínimo exigido por la ley. Puedes pedir su eliminación en cualquier momento.'] },
        { h: 'Tus derechos', p: ['Puedes acceder a tus datos, rectificarlos, suprimirlos, oponerte a su tratamiento, limitarlo o solicitar su portabilidad escribiendo a {email}. También puedes retirar tu consentimiento cuando quieras.'] },
        { h: 'Seguridad', p: ['Todo el tráfico del sitio viaja cifrado mediante HTTPS. Las fuentes tipográficas y los scripts se sirven desde nuestro propio dominio para evitar conexiones innecesarias con terceros.'] },
      ],
    },
    cookies: {
      title: 'Política de cookies',
      intro: 'Este sitio no utiliza cookies propias ni de terceros con fines de seguimiento, publicidad o análisis. Por eso no te mostramos un aviso de cookies.',
      updated: 'Última actualización',
      sections: [
        { h: '¿Qué son las cookies?', p: ['Son pequeños archivos que algunos sitios guardan en tu navegador para recordar información sobre tu visita.'] },
        { h: 'Qué usamos nosotros', p: ['Ninguna cookie. Las estadísticas de visitas se obtienen con GoatCounter, que funciona sin cookies y sin identificadores personales.', 'Tu navegador puede guardar en su caché archivos como fuentes, imágenes o scripts para que el sitio cargue más rápido. No contienen información sobre ti.'] },
        { h: 'Enlaces a otros sitios', p: ['Los productos de nuestro ecosistema pueden tener sus propios sitios con sus propias políticas. Consulta la de cada uno cuando los visites.'] },
        { h: 'Cambios', p: ['Si en el futuro incorporamos cookies, actualizaremos esta página y te pediremos consentimiento cuando la ley lo requiera.'] },
      ],
    },
  },
  en: {
    privacy: {
      title: 'Privacy policy',
      intro: 'At {name} we treat personal data with the same rigour we apply to our work: we only collect what is necessary, we protect it and we never sell it.',
      updated: 'Last updated',
      sections: [
        { h: 'Controller', p: ['The data controller is {name}. For any question about your data, write to us at {email}.'] },
        { h: 'What we collect', p: ['Only what you send us through the contact form or by email: name, email address, organisation (optional) and the content of your message.', 'We do not ask for sensitive data. Please do not include it in your messages.'] },
        { h: 'What we use it for', p: ['Solely to answer your enquiry and, if you request it, to prepare a service proposal. We do not use it for advertising or share it with third parties for commercial purposes.'] },
        { h: 'Legal basis', p: ['Your consent, given by ticking the box in the form, and our legitimate interest in answering the requests we receive.'] },
        { h: 'Service providers', p: ['Form: messages are transmitted through Formspree (formspree.io), acting as a processor that delivers them to our inbox.', 'Hosting: the site is served from GitHub Pages (GitHub, Inc.), which may log technical connection data, such as IP addresses, for security purposes.', 'Statistics: we use GoatCounter, a privacy-friendly analytics tool that uses no cookies and does not identify individuals. It only counts visits in aggregate.'] },
        { h: 'How long we keep it', p: ['For as long as the conversation or resulting professional relationship lasts and, afterwards, for the minimum period required by law. You can ask us to delete it at any time.'] },
        { h: 'Your rights', p: ['You can access, rectify or erase your data, object to or restrict its processing, or request its portability by writing to {email}. You can also withdraw your consent at any time.'] },
        { h: 'Security', p: ['All site traffic is encrypted over HTTPS. Fonts and scripts are served from our own domain to avoid unnecessary connections to third parties.'] },
      ],
    },
    cookies: {
      title: 'Cookie policy',
      intro: 'This site does not use first-party or third-party cookies for tracking, advertising or analytics. That is why we do not show you a cookie banner.',
      updated: 'Last updated',
      sections: [
        { h: 'What are cookies?', p: ['Small files some websites store in your browser to remember information about your visit.'] },
        { h: 'What we use', p: ['No cookies. Visit statistics come from GoatCounter, which works without cookies or personal identifiers.', 'Your browser may cache files such as fonts, images or scripts so the site loads faster. They contain no information about you.'] },
        { h: 'Links to other sites', p: ['Products in our ecosystem may have their own sites with their own policies. Please review them when you visit.'] },
        { h: 'Changes', p: ['If we ever introduce cookies, we will update this page and ask for your consent where the law requires it.'] },
      ],
    },
  },
};
