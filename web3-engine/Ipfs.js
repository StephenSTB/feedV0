import { create } from 'ipfs-core'

import { create as create_http } from "ipfs-http-client"

import { WebSockets } from '@libp2p/websockets'

import * as filters from '@libp2p/websockets/filters'

export const Ipfs = async (webrtc_star, http_url) =>{
  let ipfs = undefined;
    if(webrtc_star !== undefined && webrtc_star !== ""){
        console.time('IPFS Started')
        ipfs = await create({ repo: "ipfs-browser-" + Math.random(),
                              config: {
                                Addresses: {
                                  Swarm: [
                                      '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                                      '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                                      webrtc_star
                                    ]
                                },
                              },
                              libp2p: {
                                transports: [
                                  new WebSockets({
                                    filter: filters.all
                                  })
                                ]
                              },
                              start: true
                            })
        console.timeEnd('IPFS Started')
    }
    else if(http_url !== undefined & http_url !== ""){
        //console.log(http_url, "url")
        console.time('IPFS Started')
        ipfs = await create_http({url: http_url});
        console.timeEnd('IPFS Started')
    }
    else{
      console.time('IPFS Started')
        ipfs = await create({repo: "ipfs-browser-" + Math.random(),
                                config: {
                                  Addresses: {
                                    Swarm: [
                                        '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                                        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                                      ]
                                  },
                                },
                                start: true
                              })
        console.timeEnd('IPFS Started')
    }
    return ipfs;
}
