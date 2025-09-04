# DataLens dashboard guide

1. Create a connection to YDB (Serverless or Managed). Provide endpoint and database.
2. Use `interactions` table as dataset.
3. Create calculated fields:
   - purchase_flag = if(sale, 1, 0)
   - date = toDate(created_at)
4. Create widgets:
   - Calls over time: countDistinct(interaction_id) by date
   - Reached customers: countDistinct(customer_phone)
   - Conversions: sum(purchase_flag), Conversion Rate = sum(purchase_flag) / countDistinct(interaction_id)
