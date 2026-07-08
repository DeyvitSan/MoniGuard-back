CREATE TABLE IF NOT EXISTS "bitacoras" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "destino_lat" DOUBLE PRECISION NOT NULL,
    "destino_lng" DOUBLE PRECISION NOT NULL,
    "texto" TEXT NOT NULL,
    "temperatura" DOUBLE PRECISION,
    "humedad" DOUBLE PRECISION,
    "precipitacion" DOUBLE PRECISION,
    "sincronizada" BOOLEAN NOT NULL DEFAULT true,
    "creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sincronizada_en" TIMESTAMP(3),

    CONSTRAINT "bitacoras_pkey" PRIMARY KEY ("id")
);