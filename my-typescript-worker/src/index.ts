import { handler } from './handler'

declare const NAMESPACE: KVNamespace
addEventListener('fetch', (event) => {
  event.respondWith(handler(event.request, NAMESPACE))
})
