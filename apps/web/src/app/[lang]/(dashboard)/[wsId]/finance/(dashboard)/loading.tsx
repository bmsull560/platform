import StatisticCard from '@/components/cards/StatisticCard';

export default function Loading() {
  return (
    <div className="grid items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatisticCard className="md:col-span-2" loading />
      <StatisticCard loading />
      <StatisticCard loading />
      <StatisticCard loading />
      <StatisticCard loading />
      <StatisticCard loading />
      <StatisticCard loading />
    </div>
  );
}
