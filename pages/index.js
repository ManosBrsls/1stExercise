import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Sidebar from './posts/Sidebar';
import Image from 'next/image';

export default function Home() {
  return (
    <div className={styles.container4}>
      <Head>
        <title>IMS & GC-IMS Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Sidebar />

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.logoContainer2}>
            <Image
              src="/Techbiot final large1.ai_page-0001.jpg"
              alt="Logo"
              width={530}
              height={330}
              className={styles.logo}
            />
          </div>
          <div className={styles.lodMessage}>
            <p>
              <strong>Warning:</strong> The average LOD determined for a list of selected CWA is 0.26 pptv,
              and for BWA at 10¹² CFU. Under this concentration, identification is not accurate.
            </p>
          </div>
          <div className={styles.cardsContainer2}>
            <div className={styles.card2}>
              <h2>Ion Mobility Spectrometry (IMS)</h2>
              <p>
                Ion Mobility Spectrometry (IMS) is an analytical technique used to
                separate and identify ionized molecules in the gas phase based on
                their mobility through a drift tube under an electric field.
                Molecules are first ionized, then driven through a drift gas where
                they are separated according to their size, shape, and charge.
                IMS provides rapid detection with high sensitivity, making it ideal
                for chemical analysis, environmental monitoring, and security
                applications.
              </p>
            </div>

            <div className={styles.card2}>
              <h2>Gas Chromatography–Ion Mobility Spectrometry (GC-IMS)</h2>
              <p>
                Gas Chromatography–Ion Mobility Spectrometry (GC-IMS) combines gas
                chromatography (GC) and ion mobility spectrometry (IMS) to achieve
                highly selective and sensitive chemical analysis. The GC first
                separates complex mixtures into individual compounds based on
                volatility, and the IMS then analyzes these compounds according to
                their ion mobility. This hybrid technique enables detailed chemical
                fingerprinting and is widely used for food quality control,
                environmental testing, and trace detection of volatile organic
                compounds.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


