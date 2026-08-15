import { describe, it, expect } from 'vitest';
import { ProjectEngine } from '../core/project/projectEngine';
import { validateProjectSchema } from '../core/project/projectSchema';

describe('.motionstudio Project Engine Test Suite', () => {
  it('round-trips serialization and deserialization cleanly', () => {
    const project = ProjectEngine.createNewProject('Test Hero Project');
    const serialized = ProjectEngine.serialize(project);
    const deserialized = ProjectEngine.deserialize(serialized);

    const validation = validateProjectSchema(deserialized);
    expect(validation.isValid).toBe(true);
    expect(deserialized.metadata.name).toBe('Test Hero Project');
    expect(deserialized.schemaVersion).toBe('1.2.0');
  });
});
