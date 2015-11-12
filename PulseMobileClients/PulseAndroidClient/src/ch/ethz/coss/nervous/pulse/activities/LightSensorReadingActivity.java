package ch.ethz.coss.nervous.pulse.activities;

import java.util.Timer;
import java.util.TimerTask;

import android.annotation.SuppressLint;
import android.app.ProgressDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.TextView;
import ch.ethz.coss.nervous.pulse.Application;
import ch.ethz.coss.nervous.pulse.R;
import ch.ethz.coss.nervous.pulse.SensorService;
import ch.ethz.coss.nervous.pulse.R.id;
import ch.ethz.coss.nervous.pulse.R.layout;
import ch.ethz.coss.nervous.pulse.model.LightReading;
import ch.ethz.coss.nervous.pulse.utils.Utils;

@SuppressLint({ "Wakelock", "InlinedApi" })
public class LightSensorReadingActivity extends SensorReadingActivity {

	public static final String DEBUG_TAG = "LightSensorReadingActivityPulse";

	private Intent intent;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		Log.d(DEBUG_TAG, "onCreate");

		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_light);

		// Sign up button click handler
		final Button submitButton = (Button) findViewById(R.id.submit);
		
		submitButton.setOnClickListener(new OnClickListener() {
					@Override
					public void onClick(View v) {
						if (reading != null){
							
							if(reading.location == null){
								Utils.showAlert(LightSensorReadingActivity.this, "Location not found.", "Unable to find the location which is required for visualizing the data on the map. Please restart you app.");
								return;
							}
							
							Utils.showProgress(LightSensorReadingActivity.this);
							
							SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(LightSensorReadingActivity.this);
							    if (prefs.getBoolean("data_rentention", true)){
							    	reading.volatility = Long.parseLong(prefs.getString("time_limit_data_retention","-1"));
							    }else
							    	reading.volatility = 0;
							    
							Application.pushReadingToServer(reading, LightSensorReadingActivity.this);
							submitButton.setEnabled(false);
							submitButton.setText("Please wait for 5 seconds.");
							final Timer buttonTimer = new Timer();
							
							buttonTimer.scheduleAtFixedRate(new TimerTask() {
								 int counter = 5;
							    @Override
							    public void run() {
							        runOnUiThread(new Runnable() {

							            @Override
							            public void run() {
							            	if(counter < 1){

								            	submitButton.setText("Share sensor data");
							            		submitButton.setEnabled(true);
							            		buttonTimer.cancel();
							            		System.out.println("timer cancelled");
							            	}
							            	else{
							            		System.out.println("timer running");
							            		submitButton.setText("Please wait for "+counter+" seconds.");
							            		counter--;
							            	}
							            		
							            	
							            }
							        });
							    }
							}, 1000, 1000);
						}
							
					}
				});

		intent = new Intent(this, SensorService.class);

	}

	@Override
	public void onResume() {
		super.onResume();
		startService(intent);
		registerReceiver(broadcastReceiver, new IntentFilter(
				SensorService.BROADCAST_READING_ACTION));
	}

	@Override
	public void onPause() {
		super.onPause();
		
//		try {
//			unregisterReceiver(broadcastReceiver);
//		} catch (Exception e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		}
//		stopService(intent);
	}

	private BroadcastReceiver broadcastReceiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			refreshReading(intent);
		}
	};

	LightReading reading = null;

	private void refreshReading(Intent intent) {
		reading = (LightReading) intent.getSerializableExtra("LightReading");

		TextView txtLightValue = (TextView) findViewById(R.id.lightValueTF);
		if (reading != null)
			txtLightValue.setText("" + reading.lightVal+" lux");
		else 
			txtLightValue.setText("Error in reading the light sensor readings");
	}

	@Override
	public void onBackPressed() {
		super.onBackPressed();
		unregisterReceiver(broadcastReceiver);
		stopService(intent);
		Application.unregisterSensorListeners();
	}
	


}