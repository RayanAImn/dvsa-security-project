# Lesson 04 Fix Explanation

The insecure cloud configuration fix belongs in S3 bucket configuration, bucket policy, and the receipt-processing Lambda trigger path. The bucket should not accept public or unintended writes, and the Lambda function should not trust every object that appears in the bucket.

The post-fix verification is to repeat the upload/access test. Unauthorized upload or public access should fail, while the normal application receipt workflow should continue to work.
