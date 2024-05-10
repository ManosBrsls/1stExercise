import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Sidebar from './posts/Sidebar';
import Image from 'next/image';



export default function Home() {
  return (
    <div className={styles.container4}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Sidebar />

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.logoContainer}>
            <Image src="/techBiot_Logo.png" alt="Logo"  width={720} height={270}/>
          </div>
        </div>    
      </main>
    </div>
  );
}