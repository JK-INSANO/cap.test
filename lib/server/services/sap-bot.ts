/**
 * INTERFACES DE DATOS
 */
interface SapTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface SubrogacionBotPayload {
  rutUsuarioSubrogado: string;   // Viene del Formulario (ej: 12345678-9)
  rutUsuarioSubrogante: string; // Viene del Formulario
  fechaInicio: string;          // Formato DD.MM.YYYY
  fechaFin: string;             // Formato DD.MM.YYYY
}

/**
 * 1. OBTENCIÓN DEL TOKEN
 * Negocia con SAP BTP usando Client Credentials.
*/
async function getFreshToken(): Promise<string> {
  const authUrl = process.env.SAP_IRPA_AUTH_URL?.replace(/^['"]|['"]$/g, '');
  const clientId = process.env.SAP_IRPA_CLIENT_ID?.replace(/^['"]|['"]$/g, '');
  const clientSecret = process.env.SAP_IRPA_CLIENT_SECRET
    ?.trim()
    ?.replace(/\\\$/g, '$')
    ?.replace(/\$\$/g, '$');

  if (!authUrl || !clientId || !clientSecret) {
    throw new Error("Configuración incompleta: Revisa SAP_IRPA_CLIENT_ID y SECRET en el .env");
  }

  const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;

  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      console.error("Detalle error SAP Auth:", errorDetail);
      throw new Error(`Error autenticando con SAP BTP`);
    }

    const data: SapTokenResponse = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Fallo crítico en getFreshToken:", error);
    throw error;
  }
}

/**
 * 2. EJECUCIÓN DEL BOT
 * Envía la orden de subrogación al Runtime de SAP Build Process Automation
*/

export async function ejecutarBotSubrogacion(datos: SubrogacionBotPayload) {
  const url = process.env.SAP_IRPA_URL;
  const apiKey = process.env.SAP_IRPA_API_KEY;

  if (!url || !apiKey) {
    throw new Error("Configuración incompleta: Revisa SAP_IRPA_URL y SAP_IRPA_API_KEY en el .env");
  }

  const token = await getFreshToken();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'irpa-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invocationContext: "${invocation_context}",
        input: {
          Rut_UsuarioSubrogado: datos.rutUsuarioSubrogado,
          Rut_UsuarioSubrogante: datos.rutUsuarioSubrogante,
          Fecha_Inicio: datos.fechaInicio,
          Fecha_Fin: datos.fechaFin
        }
      })
    });

    const resultData = await response.json();

    if (!response.ok) {
      throw new Error(`Error SAP: ${response.status} - ${JSON.stringify(resultData)}`);
    }

    return { success: true, jobUid: resultData.jobUid };

  } catch (error) {
    console.error("Fallo en ejecutarBotSubrogacion:", error);
    return { success: false, error: "Fallo en la ejecución del bot" };
  }
}

