type HistoryItem = {
  _id: string;
  title: string;
  body?: string;
  deviceName?: string;
  device?: string;
  timestamp: string;
};

const store = {
  apps: [
    { id: 'app_1', app_name: 'App Store Pro' },
    { id: 'app_2', app_name: 'Client App' },
    { id: 'app_3', app_name: 'Demo App' },
  ],
  onlineDevices: ['device_a', 'device_b'],
  history: [
    { _id: 'h1', title: 'پخش همگانی برای "App Store Pro"', body: 'تعداد: 3200', deviceName: 'Server', timestamp: new Date().toISOString() },
    { _id: 'h2', title: 'ارسال تست', body: 'ارسال موفق', deviceName: 'Device X', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { _id: 'h3', title: 'ارسال به یک دستگاه', body: '', deviceName: 'Device Y', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { _id: 'h4', title: 'قدیمی‌تر...', body: 'مثال', deviceName: 'Device Z', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  ] as HistoryItem[],
};

export function getStore() {
  return store;
}

export function deleteHistoryItem(id: string) {
  const idx = store.history.findIndex((h) => h._id === id);
  if (idx >= 0) store.history.splice(idx, 1);
  return idx >= 0;
}
