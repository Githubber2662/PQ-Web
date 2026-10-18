export type MarblelandUser = {
  id: string;
  name: string;
};

export type MarblelandScorePayload = {
  levelId: string;
  time: number;
  user: MarblelandUser;
};

export function createMarblelandAdapter() {
  const api = {
    enabled: false,
    async connect(): Promise<boolean> {
      console.info('Marbleland adapter is enabled in stub mode. Connect via API details when available.');
      return true;
    },
    async submitScore(payload: MarblelandScorePayload): Promise<boolean> {
      console.info('Marbleland score submission stub', payload);
      return true;
    }
  };

  return api;
}
