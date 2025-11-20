import { PremiumizeClient, PremiumizeError } from "../";

const apiKey = process.env.APIKEY;

if (!apiKey) {
  console.error("APIKEY environment variable is not set");
  process.exit(1);
}

(async () => {
  try {
    const premiumize = PremiumizeClient.create(apiKey);

    // Use this endpoint to see if a user is premium or not
    const accountInfo = await premiumize.accountInfo();
    console.log(accountInfo);
  } catch (error) {
    if (error instanceof PremiumizeError) {
      console.error(`Premiumize API error: ${error.message}`);
    } else {
      console.error(`Unexpected error: ${error}`);
    }
  }
})();
