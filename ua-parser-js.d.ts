declare module 'ua-parser-js' {
    const UAParser: {
      new (userAgent?: string): {
        getResult(): {
          // Define the shape of the result object here
           device: { type: string }
        };
      };
    };
  
    export = UAParser;
  }
  