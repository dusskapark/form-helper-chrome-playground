interface Window {
    ai?: {
      languageModel: {
        create: () => Promise<any>;
      };
    };
  }
  