import type {Metadata, Viewport} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Rihla — One bag. Many memories.',description:'Plan outfits from your own wardrobe, preview with YouCam and pack for Amman, Petra and Wadi Rum.',icons:{icon:'/favicon.svg'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#294e40'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
