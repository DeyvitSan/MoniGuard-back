-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parcelas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "hectareas" DOUBLE PRECISION NOT NULL,
    "cultivo" TEXT NOT NULL DEFAULT 'cacao',
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "climas" (
    "id" TEXT NOT NULL,
    "parcela_id" TEXT NOT NULL,
    "temperatura" DOUBLE PRECISION NOT NULL,
    "humedad" DOUBLE PRECISION NOT NULL,
    "precipitacion" DOUBLE PRECISION NOT NULL,
    "nivelRiesgo" TEXT NOT NULL DEFAULT 'BAJO',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "climas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "parcelas" ADD CONSTRAINT "parcelas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "climas" ADD CONSTRAINT "climas_parcela_id_fkey" FOREIGN KEY ("parcela_id") REFERENCES "parcelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
