import { Component, output, input, signal } from '@angular/core';

@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  placeholder = input<string>('Buscar...');
  search = output<string>();

  searchTerm = signal('');

  onInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.search.emit(value);
  }
}