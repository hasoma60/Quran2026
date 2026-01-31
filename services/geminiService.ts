import { GoogleGenAI } from "@google/genai";

// Using the flash-lite model as requested for speed and efficiency
const MODEL_NAME = 'gemini-flash-lite-latest';

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

export const askQuranAI = async (
  prompt: string, 
  context?: string
): Promise<string> => {
  try {
    const ai = getClient();
    
    let fullPrompt = prompt;
    
    if (context) {
      fullPrompt = `سياق من تطبيق القرآن: ${context}\n\nسؤال المستخدم: ${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: fullPrompt,
      config: {
        systemInstruction: `أنت مساعد إسلامي عالم ومحترم اسمك "نور"، تساعد المستخدمين في فهم القرآن الكريم، البحث عن الآيات، وشرح المفاهيم.
        - تحدث دائماً باللغة العربية الفصحى.
        - اعتمد في إجاباتك على التفاسير المعتمدة (مثل ابن كثير، الطبري، السعدي).
        - كن موجزاً ونسق إجاباتك لتكون سهلة القراءة على الهاتف المحمول.
        - إذا سُئلت عن آية محددة في السياق، اشرح معناها، أسباب النزول، والتطبيق العملي لها.
        - حافظ على نغمة مهذبة وروحانية.
        - لا تصدر فتاوى شرعية؛ بدلاً من ذلك، وضح وجهات النظر المختلفة أو وجه المستخدم لاستشارة العلماء المختصين.
        `,
      }
    });

    return response.text || "عذراً، لم أتمكن من إنشاء رد في الوقت الحالي.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "حدث خطأ ما. يرجى التحقق من اتصالك والمحاولة مرة أخرى.";
  }
};