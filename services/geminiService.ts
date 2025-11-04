import { GoogleGenAI, Type } from "@google/genai";
import type { Company, Location } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  //   // For this environment, we assume it's always available.  // For this environment, we assume it's always available..  // For this environment, we assume it's always available.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const fetchResumeObjective = async (fileName: string): Promise<string> => {
  const prompt = `Analise o seguinte nome de arquivo de um currículo: "${fileName}". Com base neste nome, deduza uma área de atuação ou cargo profissional. A resposta deve ser curta e direta, ideal para ser usada como objetivo em um assunto de e-mail. Por exemplo, se o nome do arquivo for "CV_Maria_Souza_Engenheira_Software.pdf", uma boa resposta seria "Engenheira de Software". Responda apenas com o cargo/área.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    const objective = response.text.trim();
    if (objective) {
      return objective;
    }
    return "Vaga de Interesse"; // Fallback
  } catch (error) {
    console.error("Error fetching resume objective from Gemini API:", error);
    return "Vaga de Interesse"; // Fallback on error
  }
};


export const fetchCompanies = async (location: Location, resumeObjective: string): Promise<Company[]> => {
  const prompt = `Liste até 50 empresas em ${location.city}, ${location.state}, Brasil, que estão contratando ativamente para a área de "${resumeObjective}". As empresas devem usar uma das seguintes plataformas de emprego: Gupy, Infojobs, ou Vagas.com. Para cada empresa, forneça o nome, um link direto para a página de vagas da empresa na plataforma mencionada (ex: "gupy.io/empresa/vagas", não o site principal da empresa) e a plataforma de emprego que ela utiliza (ex: "Gupy", "Infojobs", "Vagas.com"). Priorize a relevância para o cargo de "${resumeObjective}".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companies: {
              type: Type.ARRAY,
              description: "A list of companies.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: 'The name of the company.',
                  },
                  jobUrl: {
                    type: Type.STRING,
                    description: 'The direct URL to the company\'s job page on the platform.',
                  },
                  platform: {
                    type: Type.STRING,
                    description: 'The job platform used by the company (e.g., Gupy, Infojobs, Vagas.com).',
                  }
                },
                required: ['name', 'jobUrl', 'platform'],
              },
            },
          },
          required: ['companies'],
        },
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (result && Array.isArray(result.companies)) {
        return result.companies as Company[];
    }
    return [];

  } catch (error) {
    console.error("Error fetching companies from Gemini API:", error);
    throw new Error("Não foi possível comunicar com o serviço de IA para obter os dados das empresas.");
  }
};