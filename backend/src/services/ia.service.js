// backend/src/services/ia.service.js
const { HfInference } = require('@huggingface/inference');

// Inicializamos el cliente de Hugging Face con el token del archivo .env
const hf = new HfInference(process.env.HF_TOKEN);
const MODELO = 'Qwen/Qwen2.5-7B-Instruct';
const SYSTEM_PROMPTS = {
    web: "Eres el asistente virtual especializado de IdeAgora, el Repositorio Digital de proyectos, tesis y documentos académicos. Tu única tarea es ayudar al usuario a encontrar, resumir y entender la información contenida exclusivamente en el contexto provisto abajo."
};

const aiService = {
    async responderConsulta(mensajeUsuario) {
        try {
            console.log("Enviando consulta real a Hugging Face:", mensajeUsuario);

            // Llamamos a la API de Hugging Face usando chatCompletion
            const response = await hf.chatCompletion({
                model: MODELO,
                messages: [
                    { 
                        role: "system", 
                        content: SYSTEM_PROMPTS.web
                    },
                    { 
                        role: "user", 
                        content: mensajeUsuario 
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            });

            // Extraemos el texto de la respuesta del modelo
            const respuestaTexto = response.choices[0].message.content;
            
            return respuestaTexto;

        } catch (error) {
            console.error("Error en la conexión con Hugging Face:", error);
            
            // Si falla el DNS o el Token, se lanza este error que capturará tu controlador
            throw new Error(`Error al conectar con la IA: ${error.message}`);
        }
    }
};

module.exports = {
    aiService
};