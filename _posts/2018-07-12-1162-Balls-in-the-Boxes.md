---
title: "1162: Balls in the Boxes"
date: 2018-07-12 22:23:23
description: "Mr. Mindless has many balls and many boxes,he wants to put all the balls into some of the boxes.Now, he wants to know how many different sol…"
tags: [CSU, 数学]
category: "18暑假集训"
---

# 1162: Balls in the Boxes

##  [1162: Balls in the Boxes](http://acm.csu.edu.cn/csuoj/problemset/problem?pid=1162) 

[](http://acm.csu.edu.cn/csuoj/problemset/submit?pid=1162) [](http://acm.csu.edu.cn/csuoj/problemset/submit?pid=1162) [](http://acm.csu.edu.cn/csuoj/problemset/summary?pid=1162) [](http://acm.csu.edu.cn/csuoj/problemset/summary?pid=1162) Time Limit: 1 Sec    Memory Limit: 128 Mb    Submitted: 1224    Solved: 329---

### Description

Mr\. Mindless has many balls and many boxes,he wants to put all the balls into some of the boxes\.Now, he wants to know how many different solutions he can have\.
you know,he could put all the balls in one box,and there could be no balls in some of the boxes\.Now,he tells you the number of balls and the numbers of boxes, can you to tell him the number of different solutions? Because the number is so large, you can just tell him the solutions mod by a given number C\.
Both of boxes and balls are all different\.



### Input

There are multiple testcases\. In each test case, there is one line cantains three integers:the number of boxes ,the number of balls,and the given number C separated by a single space\.All the numbers in the input are bigger than 0 and less than 2^63\.




### Output

For each testcase,output an integer,denotes the number you will tell Mr\. Mindless




### Sample Input

```
3 2 44 3 5
```


### Sample Output

```
14
```



题意是真的很简单。就是有一些盒子和一些球，问把所有球放进盒子里有多少种方法，需要对所给的C进行取模。思路也没什么能说的。假设A个盒子B个球，结果就是A的B次方（如果这里有不懂就自己慢慢想吧）。不用说也知道，不可能直接求结果，一是因为用pow没办法进行取模，二是long long不可能存的下。


```cpp
#include<iostream>
#include<cmath>
#define ll long long
using namespace std;
ll quick(ll a, ll b, ll m)//快速幂
{
	ll ans = 1;
	while (b)
	{
		if (b & 1)//按位与运算，判断b是否为奇数。b肯定会有至少一次为\
		奇数，除非b为0，因为任何一个大于2的数在无数次减半之后都会为1
		{
			ans = ans * a % m;
		}
		a = a % m;
		a = a * a % m;
		b >>= 1;//在结果上等价于b /= 2
	}
	return ans % m;
}
int main()
{
	ll a, b, c;
	while (cin >> a >> b >> c)
	{
		cout << quick(a, b, c) << endl;
	}
	return 0;
}
```