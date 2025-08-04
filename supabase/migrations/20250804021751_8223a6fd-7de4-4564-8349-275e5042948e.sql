-- Correção: Desmarcar os 3 leads extras do dia 03/08/2025
-- Mantendo apenas os 20 leads reais da lista do Kiwify

-- Desmarcar os 3 últimos leads como não pagos (os que não estão na lista oficial)
UPDATE formularios_parceria 
SET cliente_pago = false
WHERE id IN (
  'a3a381cc-005e-4729-a999-acddc1ca0383', -- jhonatanhr2@hotmail.com
  '66e8a194-ecef-4e31-8813-d77bf2a73fb1', -- jamilly_oliver@hotmail.com
  '5258f65e-46b2-41de-be75-7471d4bf25dc'  -- gregblue.shop@gmail.com
);

-- Verificar resultado final
-- Deve mostrar exatamente 20 leads pagos para 03/08
SELECT 
  DATE(created_at) as data,
  COUNT(*) as total_pagos
FROM formularios_parceria 
WHERE cliente_pago = true 
  AND DATE(created_at) IN ('2025-08-02', '2025-08-03')
GROUP BY DATE(created_at)
ORDER BY data;