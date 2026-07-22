import { Student, WeekPeriod, AppState } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  { id: 'std-1', name: 'Abdurrahman', phone: '' },
  { id: 'std-2', name: 'Adam Mahesa Putra', phone: '' },
  { id: 'std-3', name: 'Aleevia Putri Azzurra', phone: '' },
  { id: 'std-4', name: 'Ardiansyah', phone: '' },
  { id: 'std-5', name: 'Chiko Roland Aditya', phone: '' },
  { id: 'std-6', name: 'Diana Juliamitha', phone: '' },
  { id: 'std-7', name: 'Deva Triogama', phone: '' },
  { id: 'std-8', name: 'Fateh Rizqi Ar-Rasyid', phone: '' },
  { id: 'std-9', name: 'Farasian Evandreas Sidauruk', phone: '' },
  { id: 'std-10', name: 'Meisa Lathifah Rahayu', phone: '' },
  { id: 'std-11', name: 'Muhammad Khaerul Azam', phone: '' },
  { id: 'std-12', name: 'Muhammad Zulfikri Nasution', phone: '' },
  { id: 'std-13', name: 'Muhammad Yahya', phone: '' },
  { id: 'std-14', name: 'Muhammad Rahmat Darmawan', phone: '' },
  { id: 'std-15', name: 'Nadya Shafwah Andriany', phone: '' },
  { id: 'std-16', name: 'Nasywah Niomy Lesmana', phone: '' },
  { id: 'std-17', name: 'Ragiel Yannuari', phone: '' },
  { id: 'std-18', name: 'Rahil Reza Ramadhan', phone: '' },
  { id: 'std-19', name: 'Ravindra Farid Sinantya', phone: '' },
  { id: 'std-20', name: 'Rhacika Adzhuri Atmanegara', phone: '' },
  { id: 'std-21', name: 'Sekar Pramesti Kusumaningtyas', phone: '' },
];

export function generateAcademicWeeks(): WeekPeriod[] {
  const monthsData = [
    { name: 'Juli 2026', short: 'Jul', year: 2026, weeks: [3, 4] },
    { name: 'Agustus 2026', short: 'Agu', year: 2026, weeks: [1, 2, 3, 4] },
    { name: 'September 2026', short: 'Sep', year: 2026, weeks: [1, 2, 3, 4] },
    { name: 'Oktober 2026', short: 'Okt', year: 2026, weeks: [1, 2, 3, 4] },
    { name: 'November 2026', short: 'Nov', year: 2026, weeks: [1, 2, 3, 4] },
    { name: 'Desember 2026', short: 'Des', year: 2026, weeks: [1, 2, 3, 4] },
    { name: 'Januari 2027', short: 'Jan', year: 2027, weeks: [1, 2, 3, 4] },
    { name: 'Februari 2027', short: 'Feb', year: 2027, weeks: [1, 2, 3, 4] },
    { name: 'Maret 2027', short: 'Mar', year: 2027, weeks: [1, 2, 3, 4] },
    { name: 'April 2027', short: 'Apr', year: 2027, weeks: [1, 2, 3, 4] },
    { name: 'Mei 2027', short: 'Mei', year: 2027, weeks: [1, 2, 3, 4] },
    { name: 'Juni 2027', short: 'Jun', year: 2027, weeks: [1, 2, 3, 4] },
  ];

  const result: WeekPeriod[] = [];

  monthsData.forEach((m) => {
    m.weeks.forEach((w) => {
      const monthCode = m.name.split(' ')[0].toLowerCase().slice(0, 3);
      const id = `${m.year}-${monthCode}-w${w}`;
      result.push({
        id,
        month: m.name,
        weekNumber: w,
        year: m.year,
        label: `Minggu ${w} (${m.name})`,
        shortLabel: `${m.short} M${w}`,
      });
    });
  });

  return result;
}

export const DEFAULT_WEEKLY_TARGET = 5000;

export const DEFAULT_WA_TEMPLATE =
  'Halo [NAMA], salam dari Bendahara Kas XI DKV! 🎨\n\nInformasi kas kelas kamu per [TANGGAL]:\n• Total Tunggakan: [TUNGGAKAN]\n• Rincian Belum Lunas: [RINCIAN]\n\nMohon untuk segera melunasi ya agar kas kelas tetap lancer. Terima kasih banyak! 🙏';

export const INITIAL_STATE: AppState = {
  students: INITIAL_STUDENTS,
  weeks: generateAcademicWeeks(),
  payments: {}, // All payments initially empty = Rp 0 balance
  expenses: [], // Blank expense records initially as requested
  weeklyTarget: DEFAULT_WEEKLY_TARGET,
  activeWeekId: generateAcademicWeeks()[0].id,
  adminPin: 'dkv2026', // Default treasurer password (hidden from view)
  waReminderTemplate: DEFAULT_WA_TEMPLATE,
};
