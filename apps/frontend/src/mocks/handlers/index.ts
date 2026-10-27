import { libraryHandlers } from './library';
import { searchHandlers } from './search';
import { sessionHandlers } from './session';
import { siteHandlers } from './site';

// Feature handlers are registered here by the leader when a task is integrated.
export const handlers = [...sessionHandlers, ...libraryHandlers, ...searchHandlers, ...siteHandlers];
