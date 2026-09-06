schema = """generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  feedbacks Feedback[]
}

enum Role {
  ADMIN
  MANAGER
  USER
}

model Product {
  id          String   @id @default(uuid())
  name        String
  sku         String   @unique
  description String?
  price       Float
  cost        Float?
  stock       Int      @default(0)
  minStock    Int      @default(5)
  category    String?
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  feedbacks   Feedback[]
  movements   InventoryMovement[]
  dealItems   DealItem[]
}

enum MovementType {
  IN
  OUT
  ADJUSTMENT
}

model InventoryMovement {
  id          String        @id @default(uuid())
  productId   String
  type        MovementType
  quantity    Int
  reason      String?
  warehouse   String        @default("main")
  createdAt   DateTime      @default(now())
  product     Product       @relation(fields: [productId], references: [id])
}

model Customer {
  id          String   @id @default(uuid())
  name        String
  email       String?
  phone       String?
  company     String?
  ltv         Float    @default(0)
  loyaltyStatus String  @default("regular")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deals       Deal[]
}

enum DealStage {
  LEAD
  CONTACTED
  PROPOSAL
  NEGOTIATION
  WON
  LOST
}

model Deal {
  id          String     @id @default(uuid())
  title       String
  customerId  String
  value       Float
  stage       DealStage  @default(LEAD)
  probability Int        @default(10)
  expectedCloseDate DateTime?
  notes       String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  customer    Customer   @relation(fields: [customerId], references: [id])
  items       DealItem[]
}

model DealItem {
  id          String   @id @default(uuid())
  dealId      String
  productId   String
  quantity    Int
  unitPrice   Float
  createdAt   DateTime @default(now())
  deal        Deal     @relation(fields: [dealId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id])
}

model Feedback {
  id          String   @id @default(uuid())
  customerId  String
  productId   String?
  text        String
  sentiment   Float
  emotion     String?
  isProcessed Boolean  @default(false)
  createdAt   DateTime @default(now())
  product     Product? @relation(fields: [productId], references: [id])
}
"""

with open('prisma/schema.prisma', 'w', encoding='utf-8') as f:
    f.write(schema)
print("Schema file created successfully!")
