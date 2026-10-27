import { libraryHandlers } from './library';
import { searchHandlers } from './search';
import { sessionHandlers } from './session';

// Feature handlers are registered here by the leader when a task is integrated.
export const handlers = [...sessionHandlers, ...libraryHandlers, ...searchHandlers];
