export function startWorkers() {
  void import('./bull-mq-client-worker');
  void import('./bull-mq-main-worker');

  console.log('Workers started successfully');
}
