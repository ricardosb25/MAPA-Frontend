import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { EngineModel } from '../models/engine.model';
import { EngineService } from './engine.service';

@Injectable({
  providedIn: 'root'
})
export class MockEngineService implements EngineService {
  private initialEngines: EngineModel[] = [
    {
      id: 'ap-1-8-8v',
      manufacturer: 'VOLKSWAGEN',
      name: 'AP 1.8 8V',
      aspiration: 'ASPIRADO',
      description: 'Motor didático clássico. Ideal para a primeira calibração de ignição.',
      specification: {
        displacement: '1.8L (1.781 cm³)',
        compressionRatio: '9.2:1',
        revLimit: '6500 rpm'
      },
      isSelected: true
    },
    {
      id: 'ea888-2-0-tsi',
      manufacturer: 'VOLKSWAGEN',
      name: 'EA888 2.0 TSI',
      aspiration: 'TURBO',
      description: 'Injeção direta e turbo twin-scroll. Cuidado com detonação em carga alta.',
      specification: {
        displacement: '1.8L (1.781 cm³)',
        compressionRatio: '9.2:1',
        revLimit: '6500 rpm'
      },
      isSelected: false
    },
    {
      id: '2jz-gte-3-0',
      manufacturer: 'TOYOTA',
      name: '2JZ-GTE 3.0',
      aspiration: 'TURBO',
      description: 'Seis em linha lendário. Muita margem de boost, muita chance de fundir.',
      specification: {
        displacement: '1.8L (1.781 cm³)',
        compressionRatio: '9.2:1',
        revLimit: '6500 rpm'
      },
      isSelected: false
    },
    {
      id: 'k20a-vtec',
      manufacturer: 'HONDA',
      name: 'K20A VTEC',
      aspiration: 'ASPIRADO',
      description: 'Alta compressão e giro alto. Avanço agressivo demais destrói pistão.',
      specification: {
        displacement: '1.8L (1.781 cm³)',
        compressionRatio: '9.2:1',
        revLimit: '8500 rpm'
      },
      isSelected: false
    },
    {
      id: 'ls3-6-2-v8',
      manufacturer: 'GENERAL MOTORS',
      name: 'LS3 6.2 V8',
      aspiration: 'ASPIRADO',
      description: 'Torque desde a marcha lenta. Excelente para estudar curva de carga.',
      specification: {
        displacement: '1.8L (1.781 cm³)',
        compressionRatio: '9.2:1',
        revLimit: '6500 rpm'
      },
      isSelected: false
    },
    {
      id: 'b58-3-0-turbo',
      manufacturer: 'BMW',
      name: 'B58 3.0 Turbo',
      aspiration: 'TURBO',
      description: 'Turbo moderno com alta compressão. Exige mistura rica no topo.',
      specification: {
        displacement: '1.8L (1.781 cm³)',
        compressionRatio: '9.2:1',
        revLimit: '6500 rpm'
      },
      isSelected: false
    }
  ];

  private enginesSubject = new BehaviorSubject<EngineModel[]>(this.initialEngines);

  getEngines(): Observable<EngineModel[]> {
    return this.enginesSubject.asObservable();
  }

  getSelectedEngine(): Observable<EngineModel | null> {
    const currentEngines = this.enginesSubject.getValue();
    const selectedEngine = currentEngines.find((engine) => engine.isSelected) || null;
    return of(selectedEngine);
  }

  selectEngine(engineId: string): Observable<EngineModel> {
    const currentEngines = this.enginesSubject.getValue();
    let newlySelectedEngine: EngineModel | undefined;

    const updatedEngines = currentEngines.map((engine) => {
      if (engine.id === engineId) {
        newlySelectedEngine = { ...engine, isSelected: true };
        return newlySelectedEngine;
      }
      return { ...engine, isSelected: false };
    });

    if (!newlySelectedEngine) {
      return throwError(() => new Error(`Engine with ID ${engineId} not found.`));
    }

    this.enginesSubject.next(updatedEngines);
    return of(newlySelectedEngine);
  }
}
