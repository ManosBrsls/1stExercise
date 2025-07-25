import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Sidebar from './posts/Sidebar';
import Image from 'next/image';



export default function Home() {
  return (
    <div className={styles.container4} >
      
      <Head>
      
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
        
      </Head>

      <Sidebar />

      <main className={styles.main}>
      
        <div className={styles.content}>
        
          <div className={styles.logoContainer}>
          
            <Image src="/Techbiot final large1.ai_page-0001.jpg" alt="Logo"  width={950} height={670}/>
          </div>
        </div>    
      </main>
    </div>
  );
}