// Función para mostrar mensajes en el chat
function displayMessage(content, sender) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    const messageContent = document.createElement('p');
    messageContent.textContent = content;
    messageDiv.appendChild(messageContent);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Desplazarse hacia abajo
}

let userName = "";
let questionIndex = 0;
let userResponses = [];

// Preguntas de inteligencia
const intelligenceQuestions = [
    "¡Hola! Soy tu chatbot. ¿Cuál es tu nombre?",
    "¿Te gusta resolver problemas matemáticos?",
    "¿Prefieres aprender leyendo, viendo videos o haciendo prácticas?",
    "¿Te gusta trabajar en equipo o prefieres trabajar solo?",
    "¿Te gusta aprender sobre nuevas culturas?",
    "¿Eres bueno en deportes o actividades físicas?"
];

// Opciones para las preguntas
const answerOptions = [
    [null], // Para el nombre
    ["Sí", "No"], // Respuestas a problemas matemáticos
    ["Leyendo", "Viéndo videos", "Haciendo prácticas"], // Estilo de aprendizaje
    ["Equipo", "Solo"], // Trabajo en equipo
    ["Sí", "No"], // Aprender sobre culturas
    ["Sí", "No"] // Actividades físicas
];

// Función para iniciar el cuestionario
function startQuestionnaire() {
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    if (questionIndex === 0) {
        userInput.disabled = false; // Habilitar el input para el nombre
        sendButton.disabled = false; // Habilitar el botón de enviar
        displayMessage(intelligenceQuestions[questionIndex], 'bot');
    } else if (questionIndex < intelligenceQuestions.length) {
        displayMessage(intelligenceQuestions[questionIndex], 'bot');
        displayAnswerButtons();
    } else {
        displayMessage("Gracias por tus respuestas. Tu tipo de inteligencia se está evaluando...", 'bot');
        evaluateIntelligence();
    }
}

// Mostrar botones de respuesta
function displayAnswerButtons() {
    const footer = document.querySelector('.footer-chat');
    footer.innerHTML = ''; // Limpiar botones anteriores

    let options = answerOptions[questionIndex - 1]; // Obtener opciones según la pregunta actual
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => handleResponse(option));
        footer.appendChild(button);
    });
}

// Manejo de la respuesta del usuario
async function handleResponse(option) {
    displayMessage(option, 'user');
    userResponses.push(option);
    
    questionIndex++;
    
    // Aquí llamamos al asistente de OpenAI para una respuesta
    const assistantResponse = await getAssistantResponse(option);
    
    // Verifica si se obtuvo una respuesta de la API
    if (assistantResponse) {
        displayMessage(assistantResponse, 'bot');
    } else {
        // Mensaje de recuperación si no se obtiene respuesta
        displayMessage("Lo siento, no pude obtener una respuesta en este momento. Continuemos.", 'bot');
    }

    startQuestionnaire();
}

// Obtener respuesta del asistente de OpenAI
async function getAssistantResponse(userMessage) {
    const API_KEY = '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'; // Tu clave de API
    const apiUrl = 'https://api.openai.com/v1/chat/completions'; // URL de la API

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // Modelo que deseas usar
                messages: [{ role: 'user', content: userMessage }]
            })
        });

        if (!response.ok) {
            if (response.status === 429) {
                console.warn("Límite de solicitudes alcanzado");
                return null; // Devolver null para indicar que no se obtuvo respuesta
            }
            const errorData = await response.json();
            console.error('Error en la respuesta:', errorData);
            return null; // Devolver null para cualquier otro error
        }

        const data = await response.json();
        return data.choices[0].message.content; // Obtén la respuesta del asistente
    } catch (error) {
        console.error('Error al obtener la respuesta del asistente:', error);
        return null; // Devolver null en caso de error
    }
}

// Evaluar el tipo de inteligencia basado en las respuestas
function evaluateIntelligence() {
    const intelligenceScores = {
        "Lógica-Matemática": 0,
        "Lingüística": 0,
        "Interpersonal": 0,
        "Kinestésica": 0,
        "Musical": 0,
        "Naturalista": 0,
        "Espacial": 0,
        "Existencial": 0
    };

    userResponses.forEach(response => {
        switch(response) {
            case 'Sí':
                intelligenceScores["Lógica-Matemática"]++;
                break;
            case 'Leyendo':
                intelligenceScores["Lingüística"]++;
                break;
            case 'Viéndo videos':
                intelligenceScores["Espacial"]++;
                break;
            case 'Haciendo prácticas':
                intelligenceScores["Kinestésica"]++;
                break;
            case 'Equipo':
                intelligenceScores["Interpersonal"]++;
                break;
            // Agregar más lógica para otras respuestas
        }
    });

    // Determinar la inteligencia más alta
    const highestIntelligence = Object.keys(intelligenceScores).reduce((a, b) => intelligenceScores[a] > intelligenceScores[b] ? a : b);
    displayMessage(`Tu tipo de inteligencia es: ${highestIntelligence}.`, 'bot');

    // Evaluar estilo de aprendizaje
    evaluateLearningStyle();
}

// Evaluar estilo de aprendizaje
function evaluateLearningStyle() {
    let learningStyle = "No definido"; // Variable para guardar el estilo de aprendizaje

    if (userResponses.includes("Leyendo")) {
        learningStyle = "Aprendes mejor leyendo.";
    } else if (userResponses.includes("Viéndo videos")) {
        learningStyle = "Aprendes mejor viendo videos.";
    } else if (userResponses.includes("Haciendo prácticas")) {
        learningStyle = "Aprendes mejor haciendo prácticas.";
    }

    displayMessage(learningStyle, 'bot');
}

// Manejo del botón de enviar
document.getElementById('sendButton').addEventListener('click', () => {
    const userInput = document.getElementById('userInput');
    const userMessage = userInput.value.trim();

    if (userMessage) {
        displayMessage(userMessage, 'user');
        userInput.value = '';

        if (!userName) {
            userName = userMessage;
            displayMessage(`Encantado de conocerte, ${userName}! Te enseñaré a saber qué tipo de inteligencia tienes. Basándome en eso, seré tu asesor y te ayudaré a estudiar dependiendo de tu tipo de aprendizaje.`, 'bot');
            questionIndex++;
            startQuestionnaire(); // Iniciar el cuestionario
        }
    }
});

// Iniciar el cuestionario al cargar la página
startQuestionnaire();
