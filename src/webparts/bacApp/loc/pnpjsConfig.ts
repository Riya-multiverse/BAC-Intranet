import { spfi } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";
import { WebPartContext } from "@microsoft/sp-webpart-base";
 
let sp: any;
 
export const getSP = (context?: WebPartContext) => {
  if (!sp && context) {
    sp = spfi().using(SPFx(context));
  }
  return sp;
};