import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {

  /**
   * Filtra un arreglo de objetos basado en un término de búsqueda.
   * @param items Arreglo a filtrar (productos)
   * @param searchText Término de búsqueda
   * @param field Campo por el cual filtrar (ej. 'name')
   */
  transform(items: any[], searchText: string, field: string = 'name'): any[] {
    if (!items) return [];
    if (!searchText) return items;

    searchText = searchText.toLowerCase();

    return items.filter(it => {
      return it[field].toLowerCase().includes(searchText);
    });
  }

}
