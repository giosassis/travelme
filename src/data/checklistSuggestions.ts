import type { ChecklistCategory } from '@/types'

export interface ChecklistSuggestion {
  name: string
  category: ChecklistCategory
  quantity: number
  weight: number // kg per item
}

export const CHECKLIST_SUGGESTIONS: ChecklistSuggestion[] = [
  // Roupas
  { name: 'Camisetas', category: 'Roupas', quantity: 5, weight: 0.2 },
  { name: 'Calças', category: 'Roupas', quantity: 2, weight: 0.5 },
  { name: 'Shorts', category: 'Roupas', quantity: 3, weight: 0.2 },
  { name: 'Vestidos / Saídas de praia', category: 'Roupas', quantity: 2, weight: 0.2 },
  { name: 'Roupa íntima', category: 'Roupas', quantity: 7, weight: 0.05 },
  { name: 'Meias', category: 'Roupas', quantity: 5, weight: 0.05 },
  { name: 'Pijama', category: 'Roupas', quantity: 1, weight: 0.2 },
  { name: 'Agasalho / Moletom', category: 'Roupas', quantity: 1, weight: 0.5 },
  { name: 'Bermuda de banho', category: 'Roupas', quantity: 2, weight: 0.2 },
  { name: 'Biquíni / Sunga', category: 'Roupas', quantity: 2, weight: 0.1 },
  { name: 'Tênis', category: 'Roupas', quantity: 1, weight: 0.8 },
  { name: 'Sandálias / Chinelo', category: 'Roupas', quantity: 1, weight: 0.4 },
  { name: 'Óculos de sol', category: 'Acessórios', quantity: 1, weight: 0.05 },
  { name: 'Chapéu / Boné', category: 'Roupas', quantity: 1, weight: 0.1 },
  // Higiene e beleza
  { name: 'Shampoo', category: 'Higiene e beleza', quantity: 1, weight: 0.3 },
  { name: 'Condicionador', category: 'Higiene e beleza', quantity: 1, weight: 0.3 },
  { name: 'Sabonete líquido', category: 'Higiene e beleza', quantity: 1, weight: 0.25 },
  { name: 'Escova de dentes', category: 'Higiene e beleza', quantity: 1, weight: 0.05 },
  { name: 'Pasta de dentes', category: 'Higiene e beleza', quantity: 1, weight: 0.1 },
  { name: 'Fio dental', category: 'Higiene e beleza', quantity: 1, weight: 0.02 },
  { name: 'Desodorante', category: 'Higiene e beleza', quantity: 1, weight: 0.15 },
  { name: 'Protetor solar FPS 50+', category: 'Higiene e beleza', quantity: 1, weight: 0.2 },
  { name: 'Hidratante corporal', category: 'Higiene e beleza', quantity: 1, weight: 0.2 },
  { name: 'Repelente', category: 'Higiene e beleza', quantity: 1, weight: 0.15 },
  { name: 'Espuma / Creme de barbear', category: 'Higiene e beleza', quantity: 1, weight: 0.15 },
  { name: 'Absorvente / Protetor diário', category: 'Higiene e beleza', quantity: 1, weight: 0.1 },
  { name: 'Nécessaire', category: 'Higiene e beleza', quantity: 1, weight: 0.1 },
  // Farmácia
  { name: 'Medicamentos de uso contínuo', category: 'Farmácia', quantity: 1, weight: 0.1 },
  { name: 'Analgésico (Dipirona / Paracetamol)', category: 'Farmácia', quantity: 1, weight: 0.05 },
  { name: 'Antidiarreico', category: 'Farmácia', quantity: 1, weight: 0.05 },
  { name: 'Antiácido', category: 'Farmácia', quantity: 1, weight: 0.05 },
  { name: 'Antiemético (enjoo)', category: 'Farmácia', quantity: 1, weight: 0.05 },
  { name: 'Anti-histamínico (alergia)', category: 'Farmácia', quantity: 1, weight: 0.05 },
  { name: 'Protetor labial com FPS', category: 'Farmácia', quantity: 1, weight: 0.02 },
  { name: 'Band-aids / Curativos', category: 'Farmácia', quantity: 1, weight: 0.05 },
  { name: 'Termômetro', category: 'Farmácia', quantity: 1, weight: 0.1 },
  // Eletrônicos
  { name: 'Celular', category: 'Eletrônicos', quantity: 1, weight: 0.2 },
  { name: 'Carregador do celular', category: 'Eletrônicos', quantity: 1, weight: 0.1 },
  { name: 'Power bank', category: 'Eletrônicos', quantity: 1, weight: 0.25 },
  { name: 'Fones de ouvido', category: 'Eletrônicos', quantity: 1, weight: 0.1 },
  { name: 'Notebook / Tablet', category: 'Eletrônicos', quantity: 1, weight: 1.5 },
  { name: 'Carregador notebook', category: 'Eletrônicos', quantity: 1, weight: 0.3 },
  { name: 'Câmera fotográfica', category: 'Eletrônicos', quantity: 1, weight: 0.4 },
  { name: 'Adaptador de tomada universal', category: 'Eletrônicos', quantity: 1, weight: 0.15 },
  // Documentos
  { name: 'RG / Passaporte', category: 'Documentos', quantity: 1, weight: 0.02 },
  { name: 'CPF', category: 'Documentos', quantity: 1, weight: 0.01 },
  { name: 'Carteira de motorista (CNH)', category: 'Documentos', quantity: 1, weight: 0.01 },
  { name: 'Cartão de crédito / débito', category: 'Documentos', quantity: 2, weight: 0.01 },
  { name: 'Passagem aérea (impresso / digital)', category: 'Documentos', quantity: 1, weight: 0.01 },
  { name: 'Reserva de hospedagem', category: 'Documentos', quantity: 1, weight: 0.01 },
  { name: 'Seguro de viagem', category: 'Documentos', quantity: 1, weight: 0.01 },
  { name: 'Dinheiro em espécie', category: 'Documentos', quantity: 1, weight: 0.05 },
  // Praia
  { name: 'Toalha de praia', category: 'Praia', quantity: 1, weight: 0.5 },
  { name: 'Canga', category: 'Praia', quantity: 1, weight: 0.2 },
  { name: 'Óculos de mergulho / snorkel', category: 'Praia', quantity: 1, weight: 0.15 },
  { name: 'Bolsa de praia', category: 'Praia', quantity: 1, weight: 0.3 },
  // Acessórios
  { name: 'Guarda-chuva / capa de chuva', category: 'Acessórios', quantity: 1, weight: 0.3 },
  { name: 'Mochila pequena para passeios', category: 'Acessórios', quantity: 1, weight: 0.4 },
  { name: 'Cadeado para mochila', category: 'Acessórios', quantity: 1, weight: 0.1 },
  { name: 'Garrafa de água', category: 'Acessórios', quantity: 1, weight: 0.2 },
  { name: 'Sacolas plásticas / bags reutilizáveis', category: 'Acessórios', quantity: 3, weight: 0.05 },
]

export const SUGGESTIONS_BY_CATEGORY = CHECKLIST_SUGGESTIONS.reduce<
  Record<ChecklistCategory, ChecklistSuggestion[]>
>(
  (acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  },
  {} as Record<ChecklistCategory, ChecklistSuggestion[]>,
)
