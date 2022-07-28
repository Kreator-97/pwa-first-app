// import { updateDynamicCache } from '/js/sw-utils.js'
importScripts('/js/sw-utils.js')

const static_cache = 'static-v1'
const dynamic_cache = 'dynamic-v1'
const inmutable_cache = 'inmutable-v1'

const app_shell = [
  // '/',
  'index.html',
  'css/style.css',
  'img/favicon.ico',
  'img/avatars/hulk.jpg',
  'img/avatars/ironman.jpg',
  'img/avatars/spiderman.jpg',
  'img/avatars/thor.jpg',
  'img/avatars/wolverine.jpg',
  'js/app.js',
  'js/sw-utils.js',
]

const app_shell_inmutable = [
  'https://fonts.googleapis.com/css?family=Quicksand:300,400',
  'https://fonts.googleapis.com/css?family=Lato:400,300',
  'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
  '/css/animate.css',
  '/js/libs/jquery.js'
]

function cleanCache(cacheName, itemNumbers) {
  caches.open( cacheName )
    .then( cache => {
      return cache.keys()
      .then( keys => {
        if( keys.length > itemNumbers ) {
          cache.delete(keys[0])
            .then( cleanCache( cacheName, itemNumbers ))
        }
      })
    })
}

self.addEventListener('install', e => {
  const cacheStatic = caches.open(static_cache)
    .then( cache => {
      return cache.addAll( app_shell)
    })

    const cacheInmutable = caches.open(inmutable_cache)
    .then( cache => {
      return cache.addAll( app_shell_inmutable )
    })

  e.waitUntil( Promise.all([cacheStatic, cacheInmutable]))
})

self.addEventListener('activate', (e) => {
  const res = caches.keys().then( keys => {
    keys.forEach( key => {
      if( key !== static_cache && key.includes('static') ) {
        return caches.delete(key)
      }
    })
  })

  e.waitUntil( res )
})

self.addEventListener( 'fetch', e => {
  const res = caches.match( e.request ).then((res) => {
    if( res ) {
      return res
    } else {
      return fetch(e.request)
      .then( res => {
          return updateDynamicCache(dynamic_cache, e.request, res)
        })
    }
  })

  e.respondWith( res )
})
