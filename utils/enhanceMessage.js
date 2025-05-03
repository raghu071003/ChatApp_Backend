import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
// Alternatively, if the above doesn't work: 
// import { LLMChain } from "@langchain/core/runnables";

import dotenv from "dotenv";
import { ApiResponse } from "./ApiResponse.js";
dotenv.config({ path: "../.env" });

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",  // 'model' is the correct parameter name, not 'modelName'
    temperature: 0.7,
    apiKey: process.env.GEMINI_API_KEY ,
  });

// Define the prompt template
const prompt = new PromptTemplate({
  inputVariables: ["message"],
  template: `You are a helpful AI that improves user messages without changing the original language (it could be English, Telugu, Hinglish, or any mix).
  Rewrite the following message in a more appealing, clear, and polite tone, while keeping the original language and meaning and you should just be replying with only the enhanced message no other text:

  User Message: "{message}"
  Improved Message:`,
});

// Create the LangChain pipeline
const chain = new LLMChain({
  llm: model,
  prompt,
});

// Main function
export async function enhanceText(req,res) {
    const {message} = req.body;
    // console.log(req.body);
    
    if(!message){
        return new ApiResponse(400,{},"No message")
    }
  try {
    const result = await chain.call({ message });
    // console.log(result.text.trim());
    const newMessage = result.text.trim();
    console.log(newMessage);
    
    return res.status(200).json({newMessage})
  } catch (error) {
    console.error("Error improving message:", error);
    return message; // fallback to original message
  }
}