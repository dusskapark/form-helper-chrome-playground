import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import DOMPurify from "dompurify";
import { marked } from "marked";
import CardTitle from './components/CardTitle';
import SpinnerContainer from './components/SpinnerContainer';


// Type interfaces
interface ThemeProps {
  isDarkMode?: boolean;
}

interface AIResponseCardProps {
  formGuideHtml: string;
  error?: FormError;
  outputFormat?: string;
  fontSize?: string;
}

interface Session {
  promptStreaming: (prompt: string) => AsyncIterable<string>;
}

interface FormError {
  name: string[];
  errors: string[];
  value: any;
  touched: boolean;
}


// Constants
const DEFAULT_FONT_SIZE = '16px';
const DEFAULT_OUTPUT_FORMAT = `
# Field:[Field Name]

## Problem
[Explain briefly and clearly the cause of the error for {current value} ]

## Solution
[Provide step-by-step guidance on how to correct the error]
## Recommended Input
[Rewrite the {current value} into a valid input value and wrap it in backticks(\`)]
`;

// Styled components (unchanged)
const Card = styled.div<ThemeProps>`
  border: 1px solid ${props => props.isDarkMode ? '#333' : '#e8e8e8'};
  border-radius: 8px;
  height: 100%;
  background-color: ${props => props.isDarkMode ? '#2a2a2a' : '#f5f5f5'};
  color: ${props => props.isDarkMode ? '#ffffff' : '#000000'};
  
`;

const CardContent = styled.div<ThemeProps>`
  min-height: 120px;
  padding: 24px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0,0,0,.1);
  border-radius: 50%;
  border-top-color: #333;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  opacity: 0.8;
  font-size: 14px;
`;

const MarkdownContent = styled.div<{ fontSize: string }>`
  font-size: ${props => props.fontSize};

  h1, h2, h3, h4, h5, h6 {
    font-weight: bold;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }

  h1 { font-size: 1.5em; }
  h2 { font-size: 1.2em; }
  h3 { font-size: 1.1em; }

  p, ul, ol {
    margin-bottom: 1em;
  }
`;


const AIResponseCard: React.FC<AIResponseCardProps & ThemeProps> = ({
  formGuideHtml,
  error,
  outputFormat = DEFAULT_OUTPUT_FORMAT,
  fontSize = DEFAULT_FONT_SIZE,
  isDarkMode = false
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [helpMessage, setHelpMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    initializeSession();
  }, []);

  const generateAIResponse = useCallback(async (
    error: FormError,
    formGuideHtml: string,
    outputFormat: string = DEFAULT_OUTPUT_FORMAT
  ) => {

    if (!session) {
      console.error("Session not initialized");
      return;
    }

    setIsGenerating(true);
    setHelpMessage("");

    const prompt = `
        # Form Guide:
    \`\`\`
        ${formGuideHtml}
    \`\`\`
  
        # Current form error:
        Field: \`${error.name.join(".")}\`
        Value: \`${error.value}\`
        Error: \`${error.errors.join(", ")}\`
  
        Please provide a response in the following format:
        ${outputFormat}
      `;

    try {
      const stream = await session.promptStreaming(prompt);

      for await (const chunk of stream) {
        setHelpMessage((prev) => {
          const newMessage = chunk;
          return DOMPurify.sanitize(marked.parse(newMessage) as string);
        });
      }
    } catch (error) {
      console.error("Failed to generate AI response:", error);
      setHelpMessage("No AI response available at the moment. Please try again or wait for the response to generate.");
    } finally {
      setIsGenerating(false);
    }
  },
    [session]
  );

  useEffect(() => {
    if (error) {
      generateAIResponse(error, formGuideHtml, outputFormat);
    }
  }, [error, formGuideHtml, outputFormat, generateAIResponse]);

  const initializeSession = async () => {
    if (window.ai && window.ai.languageModel) {
      try {
        const newSession = await window.ai.languageModel.create();
        setSession(newSession);
      } catch (error) {
        console.error("Failed to initialize session:", error);
      }
    } else {
      console.error("Gemini Nano is not supported in this browser");
    }
  };

  return (
    <Card isDarkMode={isDarkMode}>
      <CardTitle isDarkMode={isDarkMode} />
      <CardContent isDarkMode={isDarkMode}>
        {helpMessage ? (
          <MarkdownContent
            fontSize={fontSize}
            dangerouslySetInnerHTML={{ __html: helpMessage }}
          />
        ) : isGenerating ? (
          <SpinnerContainer />
        ) : (
          <EmptyMessage>No help message generated yet</EmptyMessage>
        )}
      </CardContent>
    </Card>
  );
};

export default AIResponseCard;