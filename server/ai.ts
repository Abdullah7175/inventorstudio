import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateDesignRecommendations({
  projectType,
  targetAudience,
  brandGuidelines,
  currentDesigns = []
}: {
  projectType: string;
  targetAudience: string;
  brandGuidelines: string;
  currentDesigns?: string[];
}) {
  try {
    const prompt = `You are an expert design consultant. Analyze this project and provide specific design recommendations.

Project Details:
- Type: ${projectType}
- Target Audience: ${targetAudience}
- Brand Guidelines: ${brandGuidelines}
- Current Designs: ${currentDesigns.join(', ') || 'None provided'}

Provide 3-5 specific, actionable design recommendations. For each recommendation, include:
1. A clear title
2. Detailed description
3. Category (color, layout, typography, user-experience, or branding)
4. Confidence level (0.0 to 1.0)
5. Reasoning for why this matters
6. Implementation steps
7. Priority level (high, medium, low)

Respond in JSON format with an array of recommendations.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert design consultant with extensive experience in modern web design, UI/UX, and brand strategy. Provide practical, actionable recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Ensure we return the expected format
    return result.recommendations || [];
  } catch (error) {
    console.error('Error generating design recommendations:', error);
    throw new Error('Failed to generate design recommendations');
  }
}

export async function analyzeProjectHealth({
  projectData,
  timelineData,
  teamData,
  clientFeedback
}: {
  projectData: any;
  timelineData: any;
  teamData: any;
  clientFeedback: any;
}) {
  try {
    const prompt = `Analyze this project's health and provide insights.

Project Data: ${JSON.stringify(projectData)}
Timeline Data: ${JSON.stringify(timelineData)}
Team Data: ${JSON.stringify(teamData)}
Client Feedback: ${JSON.stringify(clientFeedback)}

Provide a comprehensive health analysis including:
1. Overall health score (0-100)
2. Timeline analysis with score and status
3. Budget analysis with score and status
4. Team performance analysis
5. Quality assessment
6. Communication effectiveness
7. Risk identification
8. Actionable recommendations

Respond in JSON format with structured health data.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a project management expert specializing in design and development projects. Provide data-driven insights and actionable recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('Error analyzing project health:', error);
    throw new Error('Failed to analyze project health');
  }
}

export async function generateCommunicationContent({
  type,
  context,
  clientInfo,
  projectInfo,
  tone = 'professional'
}: {
  type: 'welcome' | 'update' | 'reminder' | 'completion' | 'custom';
  context: string;
  clientInfo: any;
  projectInfo: any;
  tone?: string;
}) {
  try {
    const prompt = `Generate ${type} communication content for a client.

Client Info: ${JSON.stringify(clientInfo)}
Project Info: ${JSON.stringify(projectInfo)}
Context: ${context}
Tone: ${tone}

Create personalized communication content that is:
- Professional and engaging
- Specific to the client and project
- Actionable where appropriate
- Appropriately formatted

Respond in JSON format with subject and content fields.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional communications specialist for a design agency. Create personalized, engaging content that maintains professional relationships."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('Error generating communication content:', error);
    throw new Error('Failed to generate communication content');
  }
}