// 2025-2026 流行趋势预设色板配置
// 共 10 组，每组 16 色，总计 160 个颜色

export interface Palette {
  id: string;
  name: string;
  description: string;
  colors: string[];
}

export const PRESET_PALETTES: Palette[] = [
  {
    id: 'serenity-calm',
    name: '🌊 Serenity Calm',
    description: '宁静柔和的马卡龙色系',
    colors: [
      '#A7C7E7', '#C1E1C1', '#FFDFD3', '#FFE5B4',
      '#E0BBE4', '#957DAD', '#D291BC', '#FF9AA2',
      '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7',
      '#C7CEEA', '#B5D8FF', '#D9D2E9', '#E5D9F2',
    ],
  },
  {
    id: 'sunset-glow',
    name: '🌅 Sunset Glow',
    description: '日落暖光，充满活力与温暖感',
    colors: [
      '#FF6B6B', '#FF8E53', '#FEC89A', '#FFD6A5',
      '#FDFFB6', '#CAFFBF', '#9BF6FF', '#BDB2FF',
      '#FFC6FF', '#FFADAD', '#FFD6A5', '#FDFFB6',
      '#CAFFBF', '#9BF6FF', '#BDB2FF', '#FFC6FF',
    ],
  },
  {
    id: 'modern-corporate',
    name: '💼 Modern Corporate',
    description: '专业商务，基于 Tailwind Blue',
    colors: [
      '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF',
      '#1E3A8A', '#0F172A', '#4F46E5', '#6366F1',
      '#818CF8', '#A5B4FC', '#C7D2FE', '#DBEAFE',
      '#EFF6FF', '#F0F9FF', '#F0FDFA', '#F0FDF4',
    ],
  },
  {
    id: 'nature-harmony',
    name: '🌿 Nature Harmony',
    description: '自然和谐，环保与可持续感',
    colors: [
      '#22543D', '#2D6A4F', '#40916C', '#52B788',
      '#74C69D', '#95D5B2', '#B7E4C7', '#D8F3DC',
      '#264653', '#2A9D8F', '#8AC926', '#C3E6CB',
      '#84A98C', '#B7E4C7', '#E8F5E9', '#F1F8E9',
    ],
  },
  {
    id: 'vibrant-energy',
    name: '🔥 Vibrant Energy',
    description: '活力四射，高饱和度的年轻品牌色彩',
    colors: [
      '#FF6B6B', '#FECA57', '#48DBFB', '#FF9FF3',
      '#54A0FF', '#FFE66D', '#1DD1A1', '#FF6348',
      '#00D2D3', '#D63031', '#E17055', '#00B894',
      '#00CEC9', '#6C5CE7', '#A29BFE', '#FD79A8',
    ],
  },
  {
    id: 'pastel-dream',
    name: '🎨 Pastel Dream',
    description: '粉彩梦境，梦幻柔和的色彩',
    colors: [
      '#E0BBE4', '#957DAD', '#D291BC', '#FEC8D8',
      '#FFDFD3', '#F7DC6F', '#F1948A', '#BB8FCE',
      '#85C1E9', '#82E0AA', '#F8B500', '#FFC300',
      '#FF5733', '#C70039', '#900C3F', '#581845',
    ],
  },
  {
    id: 'dark-mode-pro',
    name: '🌑 Dark Mode Pro',
    description: '专业暗色，完整的灰色梯度',
    colors: [
      '#0F172A', '#1E293B', '#334155', '#475569',
      '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0',
      '#1F2937', '#374151', '#4B5563', '#6B7280',
      '#9CA3AF', '#D1D5DB', '#F3F4F6', '#F9FAFB',
    ],
  },
  {
    id: 'mermaid-fantasy',
    name: '🐚 Mermaid Fantasy',
    description: '人鱼幻想，海洋与童话的想象',
    colors: [
      '#4ECDC4', '#556270', '#FF6B6B', '#C7F464',
      '#A8E6CF', '#DCEDC8', '#FFD3B5', '#FFAAA5',
      '#FF8B94', '#6C5B7B', '#C06C84', '#F67280',
      '#F8B195', '#C0CAAD', '#6B5B5F', '#87A878',
    ],
  },
  {
    id: 'galaxy-nebula',
    name: '🌟 Galaxy Nebula',
    description: '银河星云，未来感强烈的深空色彩',
    colors: [
      '#0C0C1E', '#1A1A2E', '#16213E', '#0F3460',
      '#533483', '#5C7CF4', '#94D2BD', '#0A9396',
      '#EE9B00', '#CA6702', '#BB3E03', '#AE2012',
      '#9B2226', '#7209B7', '#6D28D9', '#A855F7',
    ],
  },
  {
    id: 'spring-bloom',
    name: '🐝 Spring Bloom',
    description: '春日绽放，温暖而富有层次感的花卉色彩',
    colors: [
      '#FFCDB2', '#FFB4A2', '#E5989B', '#B5838D',
      '#6D6875', '#F8E16C', '#FFC2B4', '#FF9770',
      '#FF6F3C', '#C73E1D', '#9A031E', '#5F0F40',
      '#720026', '#4C0027', '#A4133C', '#DB222A',
    ],
  },
];

// 快速取色：单色彩选（适合「替换全部」场景）
export const SINGLE_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];
