import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function generateMotivationalQuote(): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a motivational coach. Generate short, uplifting one-liners (maximum 2 sentences) for someone trying to stay focused and productive. Make them inspiring but not cheesy."
        },
        {
          role: "user",
          content: "Give me a motivational quote for a focus session"
        }
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    return response.choices[0].message.content || "Stay focused, you're doing amazing!";
  } catch (error) {
    console.error("Failed to generate motivational quote:", error);
    // Fallback quotes if API fails
    const fallbackQuotes = [
      "Stay focused, you're doing amazing!",
      "Every moment of concentration brings you closer to your goals.",
      "Focus is the bridge between thought and accomplishment.",
      "You have the power to create extraordinary results through focused effort.",
      "Deep work creates deep rewards. Keep going!"
    ];
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  }
}
