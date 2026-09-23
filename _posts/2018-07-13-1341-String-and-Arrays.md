---
title: "1341: String and Arrays"
date: 2018-07-13 12:50:05
description: "有一个 N * N 的字符矩阵，从上到下依次记为第1行，第2行，……，第 N 行，从左至右依次记为第1列，第2列，……，第 N 列。 对于这个矩阵会进行一系列操作，但这些操作只有两类： (1) R : 将矩阵逆时针旋转90度…"
tags: [CSU, 数学, 计算几何]
category: "18暑假集训"
---

# 1341: String and Arrays

##  [1341: String and Arrays](http://acm.csu.edu.cn/csuoj/problemset/problem?pid=1341) 

[](http://acm.csu.edu.cn/csuoj/problemset/submit?pid=1341) [](http://acm.csu.edu.cn/csuoj/problemset/submit?pid=1341) [](http://acm.csu.edu.cn/csuoj/problemset/summary?pid=1341) [](http://acm.csu.edu.cn/csuoj/problemset/summary?pid=1341) Time Limit:1 SecMemory Limit:128 MbSubmitted:794Solved:186---

### Description

有一个 *N* \* *N* 的字符矩阵，从上到下依次记为第1行，第2行，……，第 *N* 行，从左至右依次记为第1列，第2列，……，第 *N* 列。
对于这个矩阵会进行一系列操作，但这些操作只有两类：
\(1\) *R* : 将矩阵逆时针旋转90度；
\(2\) *P x y* : 将此时第 *x* 行第 *y* 列的字符打印出来，其中1 <= *x* , *y* <= *N* 。



### Input

输入数据的第一行包含一个整数 *T* \(1 <= *T* <= 20\)，表示接下来一共有T组测试数据。
对于每组测试数据，第一行包含一个整数 *N* \(1 <= *N* <= 300\)，含义同上。接下来一共有 *N* 行，每行均包含 *N* 个大写字母，描述了这个矩阵的初始情况。再接下来一行包含一个整数 *M* \(1 <= *M* <= 10000\)，表示一共对矩阵进行了 *M* 次操作。接下来 *M* 行，每行均包含一个符合上述格式的操作，依次描述了这 *M* 个操作。



### Output

对于每个第\(2\)类操作，用一行打印出指定位置的字符。
相邻的两组测试数据中间用一个空行隔开。



### Sample Input

```
3
2
AB
CD
3
P 1 1
R
P 1 1
2
AB
CD
4
R
R
P 2 1
P 1 2
3
ABC
DEF
GHI
5
P 3 3
R
P 3 3
R
P 3 3
```


### Sample Output

```
A
B

B
C

I
G
A
```



这个题考的并不是矩阵旋转，因为旋转会妥妥的超时。一种比较好的方法是找到旋转后矩阵中某元素位置与原矩阵位置坐标的关系。而且四次旋转就会转成原位置，所以要找的其实也就只是三种而已。只不过需要小心点输入的读取就好了，感觉字符读取容易出错，因为每一行的结尾都是有一个换行符存在的。提醒，注意是逆时针旋转的，别搞错方向了。

代码不长，就是输入，判断和输出。看不懂再问吧


```cpp
#include<iostream>
#include<cstring>
using namespace std;
char aa[305][305];
char a[5];
int main()
{
	int t;
	scanf ("%d", &t);
	while (t--)
	{
		int n;
		scanf ("%d", &n);getchar();
		for (int i = 1; i <= n; i++)
		{
			for ( int j = 1; j <= n; j++)
			{
				scanf ("%c", &aa[i][j]);
			}
			getchar();
		}
		int m;
		int cnt = 0;
		scanf ("%d", &m);
		getchar();
		while (m--)
		{
			scanf ("%s", a);
			if (a[0] == 'R')
			{
				cnt++;
			}
			else
			{
				int x, y;
				scanf ("%d%d", &x, &y);getchar();
				if (cnt % 4 == 0)
				{
					printf ("%c\n", aa[x][y]);
				}
				else if (cnt % 4 == 3)
				{
					printf ("%c\n", aa[n - y + 1][x]);
				}
				else if (cnt % 4 == 2)
				{
					printf ("%c\n", aa[n - x + 1][n - y + 1]);
				}
				else
				{
					printf ("%c\n", aa[y][n - x + 1]);
				}
			}
		}
		printf ("\n");
	}
	return 0;
}
```