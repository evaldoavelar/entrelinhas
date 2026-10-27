import { libraryHandlers } from './library';
import { sessionHandlers } from './session';

// Feature handlers are registered here by the leader when a task is integrated.
export const handlers = [...sessionHandlers, ...libraryHandlers];
