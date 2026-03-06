import { useState } from "react";

type Opportunity = {
  trendName: string;
  explanation: string;
  businessIdea: string;
  monetization: string;
  difficultyScore: number;
  startupPotential: number;
};

export default function Home() {
  const [opportunities] = useState<Opportunity[]>([
    {
      trendName: "AI automation for restaurants",
      explanation: "Restaurants want to automate bookings and reviews.",
      businessIdea: "Offer AI automation service for restaurants.",
      monetization: "200€/month per restaurant",
      difficultyScore: 5,
      startupPotential: 82,
    },
    {
      trendName: "AI tutoring tools",
      explanation: "Students increasingly use AI for personalized learning.",
      businessIdea: "Create AI-powered tutoring for exams.",
      monetization: "15€/month subscription",
      difficultyScore: 6,
      startupPotential: 78,
    },
    {
      trendName: "AI customer support automation",
      explanation: "Companies want to reduce support costs.",
      businessIdea: "Automate customer support with AI chatbots.",
      monetization: "50€/month SaaS",
      difficultyScore: 7,
      startupPotential: 85,
    },
  ]);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>TrendRadar 🚀</h1>
      <h2>Today's Opportunities</h2>

      {opportunities.map((op, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ddd",
            padding: 20,
            marginTop: 20,
            borderRadius: 10,
          }}
        >
          <h3>{op.trendName}</h3>
          <p>{op.explanation}</p>

          <p>
            <strong>Business Idea:</strong> {op.businessIdea}
          </p>

          <p>
            <strong>Monetization:</strong> {op.monetization}
          </p>

          <p>
            <strong>Difficulty:</strong> {op.difficultyScore}/10
          </p>

          <p>
            <strong>Opportunity Score:</strong> {op.startupPotential}/100
          </p>
        </div>
      ))}
    </div>
  );
}
