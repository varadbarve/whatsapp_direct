package com.varad.directchat;
import android.Manifest;
import android.database.Cursor;
import android.provider.CallLog;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import org.json.JSONArray;
@NativePlugin(permissions = {Manifest.permission.READ_CALL_LOG})
public class CallLogPlugin extends Plugin {
    @PluginMethod
    public void getCallLogs(PluginCall call) {
        if (!hasPermission(Manifest.permission.READ_CALL_LOG)) {
            requestPermission(Manifest.permission.READ_CALL_LOG);
            call.reject("Permission required");
            return;
        }
        JSONArray logs = new JSONArray();
        Cursor cursor = getContext().getContentResolver().query(
            CallLog.Calls.CONTENT_URI, null, null, null, CallLog.Calls.DATE + " DESC"
        );
        if (cursor != null) {
            int numberCol = cursor.getColumnIndex(CallLog.Calls.NUMBER);
            int typeCol = cursor.getColumnIndex(CallLog.Calls.TYPE);
            int dateCol = cursor.getColumnIndex(CallLog.Calls.DATE);
            
            int count = 0;
            while (cursor.moveToNext() && count < 20) {
                JSObject log = new JSObject();
                log.put("number", cursor.getString(numberCol));
                log.put("type", cursor.getInt(typeCol));
                log.put("date", cursor.getLong(dateCol));
                logs.put(log);
                count++;
            }
            cursor.close();
        }
        JSObject result = new JSObject();
        result.put("logs", logs);
        call.resolve(result);
    }
}