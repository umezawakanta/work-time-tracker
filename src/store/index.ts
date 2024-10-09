import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import workTimeReducer from './workTimeSlice';
import assetReducer from './assetSlice';
import debtReducer from './debtSlice';
import userReducer from './userSlice';
import todoReducer from './todoSlice';
import candidateReducer from './candidateSlice';
import subscriptionReducer from './subscriptionSlice';
import withdrawalReducer from './withdrawalSlice';
import bookReducer from './bookSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['book'], // 本棚データのみを永続化
};

const rootReducer = combineReducers({
  workTime: workTimeReducer,
  asset: assetReducer,
  debt: debtReducer,
  user: userReducer,
  todo: todoReducer,
  candidate: candidateReducer,
  subscription: subscriptionReducer,
  withdrawal: withdrawalReducer,
  book: bookReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;