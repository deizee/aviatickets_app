import { format } from 'date-fns';

export function formatDate(str, type) {  // type - это шаблон форматирования из библиотеки date-fns (в виде строки)
    const date = new Date(str);
    return format(date, type);
}