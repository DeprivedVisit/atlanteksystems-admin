const { CloudFrontClient, CreateInvalidationCommand } = require("@aws-sdk/client-cloudfront");

const cfClient = new CloudFrontClient();

exports.handler = async (event) => {
  const distributionId = process.env.DISTRIBUTION_ID;
  
  if (!distributionId) {
    console.error("Error: DISTRIBUTION_ID environment variable is missing.");
    return;
  }

  const params = {
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: `s3-upload-${Date.now()}`,
      Paths: {
        Quantity: 1,
        Items: ["/*"], // Invalida todo el sitio para asegurar que el JS/CSS/HTML se sincronicen
      },
    },
  };

  try {
    await cfClient.send(new CreateInvalidationCommand(params));
    console.log(`✓ Invalidation triggered for: ${distributionId}`);
  } catch (error) {
    console.error("Error triggering invalidation:", error);
  }
};