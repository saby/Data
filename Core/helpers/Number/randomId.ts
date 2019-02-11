function randomId(prefix?: string): string {
   return (prefix || 'ws-') + Math.random().toString(36).substr(2) + (+new Date());
}

export = randomId;
