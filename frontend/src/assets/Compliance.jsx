import styles from "./Compliance.module.css";

function Compliance({ client }) {
  const { name, loan, number } = client;
  // const percent = (loan * 0.1).toFixed(2);
  //   const now = new Date();
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className={styles.containee}>
      <div className={styles.container}>
        <header>
          <h1>
            Account Qualification & <br /> compliance
          </h1>
          <div className={styles.clientDetsils}>
            <p>Applicant Name:</p>
            <h2>{name} </h2>
            <p>Phone Number:</p>
            <h2>{number} </h2>
            <p>Application staus:</p>
            <h3>Pending</h3>
            <p>Application date:</p>
            <h2>{today}</h2>
          </div>

          <div className={styles.congrtulations}>
            <h1>Dear {name},</h1>
            <p>
              You are not qualified for a loan of ${loan},since your account is
              inactive.
            </p>
            <p>
              Kindly use your account for a week then get back to us, thank you!
            </p>
            <p>
              Your credit score of 520 does not qualify you for enhanced terms.
            </p>
            <div>
              <span>720</span>
              <p>credit score</p>
            </div>
          </div>
          <div className={styles.compliance}>
            <h1>Compliance Notice</h1>
            <p>
              Your EcoCash account must be active and maintain a security
              deposit of at least USD 100. This security makes you eligible for
              our loans and ensures compliance with our lending policies.
              Inactive accounts may not qualify for loans or may be subject to
              higher interest rates.
            </p>
          </div>
          <footer className={styles.footer}>
            <p>Last updated: 2025-12-12 03:19:27</p>
          </footer>
        </header>
      </div>
    </div>
  );
}

export default Compliance;
